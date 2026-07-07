import { ChapterStatus, EducationLevel, Skill } from '@prisma/client';
import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Storage {
    simetadata: {
      chapterId: string;
      skills: Skill[];
      educationLevels: EducationLevel[];
      coverPath: string | null;
      chapterStatus?: ChapterStatus;
    };
  }
}

const SIMetadata = Extension.create({
  name: 'simetadata',

  addStorage() {
    return {
      chapterId: "",
      skills: [],
      educationLevels: [],
      coverPath: ""
    }
  },

  onUpdate() {
  },
})

export default SIMetadata;
