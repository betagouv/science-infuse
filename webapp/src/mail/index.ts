import { UserFull } from '@/types/api'
import axios from 'axios'

interface Recipient {
    name: string
    email: string
}

interface Attachment {
    name: string
    type: string
    content: string
}

interface AdditionalHeader {
    key: string
    value: string
}

interface EmailData {
    from: {
        name: string
        email: string
    }
    to: Recipient[]
    subject: string
    project_id: string
    text?: string
    html: string
    attachments?: Attachment[]
    additional_headers?: AdditionalHeader[]
}

export async function sendMail(to: UserFull, subject: string, html: string): Promise<void> {
    const region = process.env.SCW_REGION
    const scwSecretKey = process.env.SCW_SECRET_KEY;
    const scwProjectId = process.env.SCW_PROJECT_ID;
    // TODO: custom exception use @errors/
    if (!to.email) return;
    if (!region || !scwSecretKey || !scwProjectId) {
        throw new Error('REGION, SCW_SECRET_KEY and SCW_PROJECT_ID must be set in environment variables')
    }

    const emailData: EmailData = {
        from: {
            name: `Science Infuse`,
            email: `contact@science-infuse.beta.gouv.fr`
        },
        to: [
            {
                name: `${to.firstName} ${to.lastName}`,
                email: to.email
            }
        ],
        subject: subject,
        project_id: scwProjectId,
        html: html,
        // attachments: [
        //     {
        //         name: 'test.pdf',
        //         type: 'application/pdf',
        //         content: 'AAAA==' // Base64 encoded PDF content
        //     }
        // ],
        // additional_headers: [
        //     {
        //         key: 'Reply-To',
        //         value: 'reply@example.com'
        //     }
        // ]
    }

    try {
        const response = await axios.post(
            `https://api.scaleway.com/transactional-email/v1alpha1/regions/${region}/emails`,
            emailData,
            {
                headers: {
                    'X-Auth-Token': scwSecretKey,
                    'Content-Type': 'application/json',
                },
            }
        )

        console.log('Email sent successfully:', response.data)
    } catch (error) {
        console.error('Error sending email:', error)
        throw error
    }
}
