'use client'

import React from 'react'
import PDFUploadAndConvert from '@/components/pdf/pdf-upload-converter'

const PDF2CSVConverterPage = () => {
  return (
    <div className="flex flex-col p-10 w-full grow">
      <PDFUploadAndConvert />
    </div>
  )
}

export default PDF2CSVConverterPage