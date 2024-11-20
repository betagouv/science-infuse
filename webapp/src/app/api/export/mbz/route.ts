import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { NextRequest, NextResponse } from "next/server";
import { ExportUrlResponse } from '@/types/api';
import axios from 'axios';
const { JSDOM } = require('jsdom');

// const Docker = require('dockerode');
// const docker = new Docker();
// async function runCommandInMoodle(command: string) {
//     const container = docker.getContainer('moodle');
//     const exec = await container.exec({
//         Cmd: ['bash', '-c', command],
//         AttachStdout: true,
//         AttachStderr: true
//     });

//     const stream = await exec.start();
//     container.modem.demuxStream(stream, process.stdout, process.stderr);
// }

const { exec } = require('child_process');

// Execute command in Moodle container
const runCommandInMoodle = async (command: string, raw?: boolean) => {
    return new Promise((resolve, reject) => {
        const final_cmd = raw == true ? command : `docker exec moodle sh -c '${command}'`
        // console.log("final_cmd\n", final_cmd)
        exec(final_cmd, (error: any, stdout: any) => {
            // console.log("STDOUT", stdout)
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout);
        });
    });
};




interface SectionParams {
    courseid: number;
    sectionname: string;
    sectionnum: number;
}

interface PageParams {
    courseid: number;
    sectionnum: number;
    urlname: string;
    content: string;
    visible: number;
}

interface PageUpdateParams {
    cmid: number;
    content: string;
}

function restApiParameters(inArgs: any, prefix: string = '', outDict: Record<string, any> = {}): Record<string, any> {
    if (typeof inArgs !== 'object' || inArgs === null) {
        outDict[prefix] = inArgs;
        return outDict;
    }

    const newPrefix = prefix === '' ? '{0}' : prefix + '[{0}]';

    if (Array.isArray(inArgs)) {
        inArgs.forEach((item, idx) => {
            restApiParameters(item, newPrefix.replace('{0}', idx.toString()), outDict);
        });
    } else {
        Object.entries(inArgs).forEach(([key, item]) => {
            restApiParameters(item, newPrefix.replace('{0}', key), outDict);
        });
    }

    return outDict;
}

class MoodleCourseCreator {
    private domain: string;
    private token: string;
    private baseUrl: string;

    constructor(domain: string, token: string) {
        this.domain = domain.replace(/\/$/, '');
        this.token = token;
        this.baseUrl = `${this.domain}/webservice/rest/server.php`;
    }

    private async callMoodleApi(wsfunction: string, params: Record<string, any> = {}): Promise<any> {
        const parameters = restApiParameters(params);
        Object.assign(parameters, {
            wstoken: this.token,
            moodlewsrestformat: 'json',
            wsfunction: wsfunction
        });

        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(parameters),
        });

        if (!response.ok) {
            throw new Error(`API call failed with status code: ${response.status}`);
        }

        const result = await response.json();

        if (result && typeof result === 'object' && 'exception' in result) {
            throw new Error(`Moodle API error: ${result.message}\nDebug info: ${result.debuginfo || ''}`);
        }

        return result;
    }

    async createCourse(fullName: string, shortName: string, categoryId: number = 1, numSections: number = 0): Promise<number | null> {
        const params = {
            courses: [{
                fullname: fullName,
                shortname: shortName,
                categoryid: categoryId,
                format: 'topics',
                numsections: numSections
            }]
        };

        const result = await this.callMoodleApi('core_course_create_courses', params);
        if (Array.isArray(result) && result.length > 0) {
            return result[0].id;
        }
        return null;
    }

    async addSectionToCourse(courseId: number, title: string, position: number = 0): Promise<any> {
        const params: SectionParams = {
            courseid: courseId,
            sectionname: title,
            sectionnum: position
        };
        return this.callMoodleApi('local_course_add_new_section', params);
    }

    async getCourseSections(courseId: number): Promise<any> {
        return this.callMoodleApi('local_wsmanagesections_get_sections', { courseid: courseId });
    }

    async addPageToSection(courseId: number, sectionNumber: number, title: string, content: string): Promise<any> {
        const params: PageParams = {
            courseid: courseId,
            sectionnum: sectionNumber,
            urlname: title,
            content: content,
            visible: 1
        };
        return this.callMoodleApi('local_course_add_new_course_module_page', params);
    }

    async updatePageContent(pageId: number, content: string): Promise<any> {
        const params: PageUpdateParams = {
            cmid: pageId,
            content: content
        };
        return this.callMoodleApi('local_course_update_course_module_page', params);
    }
}

const moodleCourseCreator = new MoodleCourseCreator(`${process.env.MOODLE_URL}`, `${process.env.MOODLE_TOKEN}`)

const moodleDockerBackupPath = `/home`
export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
    const { html } = await request.json();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const containers = document.querySelectorAll('.chapter-course-block');
    const title = document.querySelector('h1')?.textContent || '';
    const slug = `${title.toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, '-')}-${uuidv4().split('-')[0]}`;
    const containerContents = Array.from(containers).map((container: any) => container.innerHTML);

    const courseId = await moodleCourseCreator.createCourse(title, slug, 1, 0);

    if (courseId) {
        for (let i = 0; i < containerContents.length; i++) {
            const sectionTitle = containers[i].querySelector('.course-block-title')?.textContent || '';
            const contentContainer = containers[i].cloneNode(true) as Element;

            // if quiz, remove
            const quizElement = contentContainer.querySelector('.course-block-quiz');
            if (quizElement) {
                quizElement.remove();
            }

            await moodleCourseCreator.addSectionToCourse(courseId, sectionTitle, i + 1)
            await moodleCourseCreator.addPageToSection(courseId, i + 1, "Cours", contentContainer.innerHTML);
        }
    }

    const {backupId} = (await axios.get(`${process.env.MOODLE_NODE_SERVER_URL}/backup_course?courseId=${courseId}`)).data
    console.log("BACKUP ID", backupId);
    const downloadUrl = `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/export/mbz?id=${backupId}&name=cours-science-infuse`;
    return NextResponse.json({ url: downloadUrl } as ExportUrlResponse);
}


export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const name = searchParams.get('name') || 'cours';
    const fs = require('fs');
    
    
    const response = await axios.get(`${process.env.MOODLE_NODE_SERVER_URL}/get_backup?id=${id}`, {
        responseType: 'arraybuffer'
    })

    // Save the file locally
    const localBackupPath = `/tmp/${id}.mbz`
    fs.writeFileSync(localBackupPath, response.data)

    // Get the backup file path
    const mbzFilePath = localBackupPath

    if (!mbzFilePath.trim()) {
        return NextResponse.json({ error: "Backup file not found" }, { status: 404 });
    }

    if (!fs.existsSync(localBackupPath)) {
        return NextResponse.json({ error: "File not found" }, { status: 500 });
    }

    const fileContent = fs.readFileSync(localBackupPath);

    // delete after read
    fs.unlinkSync(localBackupPath);

    // return file
    return new NextResponse(fileContent, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${name}-${id}.mbz"`,
        },
    });
}