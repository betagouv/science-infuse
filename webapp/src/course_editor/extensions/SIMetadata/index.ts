import { Extension } from '@tiptap/core'

const SIMetadata = Extension.create({
  name: 'simetadata',

  addStorage() {
    return {
      chapterId: "",
      skills: [],
      educationLevels: []
    }
  },

  onUpdate() {
  },
})

export default SIMetadata;