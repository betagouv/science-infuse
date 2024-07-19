import { Extension } from '@tiptap/core'

const SIMetadata = Extension.create({
  name: 'simetadata',

  addStorage() {
    return {
      chapterId: "",
    }
  },

  onUpdate() {
  },
})

export default SIMetadata;