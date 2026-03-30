import { pdf } from '@react-pdf/renderer'
import React from 'react'

export async function generatePdfBlob(element: React.ReactElement): Promise<Blob> {
  const doc = pdf(element)
  return await doc.toBlob()
}
