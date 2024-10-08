import { ChapterStatus } from '@prisma/client';
import { Extension } from '@tiptap/core'

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