'use client'
import React from 'react'
import CourseEditor from '../../course_editor'

const CoursPage: React.FC = () => {
  return (
    <div className="container mx-auto relative min-h-[500px] w-full max-w-screen-lg border border-solid border-[#f1f5f9] bg-background sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:shadow-lg mt-8 p-4 md:p-16 ">
      {/* Add more content here */}
      <CourseEditor/>
    </div>
  )
}

export default CoursPage
