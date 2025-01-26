import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import type { Recording } from '../types';

export async function exportToPDF(recording: Recording) {
  if (!recording.aiReport) return;

  const doc = new jsPDF();
  let yPos = 20;
  const lineHeight = 7;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;

  // Title
  doc.setFontSize(16);
  doc.text('Medical Report', pageWidth / 2, yPos, { align: 'center' });
  yPos += lineHeight * 2;

  // Patient Info
  doc.setFontSize(12);
  doc.text(`Patient: ${recording.patientName}`, margin, yPos);
  yPos += lineHeight;
  doc.text(`Doctor: ${recording.doctorName}`, margin, yPos);
  yPos += lineHeight;
  doc.text(`Date: ${recording.createdAt.toLocaleDateString()}`, margin, yPos);
  yPos += lineHeight * 2;

  // Symptoms
  doc.setFontSize(14);
  doc.text('Symptoms:', margin, yPos);
  yPos += lineHeight;
  doc.setFontSize(12);
  recording.aiReport.symptoms.forEach(symptom => {
    doc.text(`• ${symptom}`, margin + 5, yPos);
    yPos += lineHeight;
  });
  yPos += lineHeight;

  // Diagnosis
  doc.setFontSize(14);
  doc.text('Diagnosis:', margin, yPos);
  yPos += lineHeight;
  doc.setFontSize(12);
  const diagnosisLines = doc.splitTextToSize(recording.aiReport.diagnosis, pageWidth - margin * 2);
  diagnosisLines.forEach(line => {
    doc.text(line, margin, yPos);
    yPos += lineHeight;
  });
  yPos += lineHeight;

  // Treatment
  doc.setFontSize(14);
  doc.text('Treatment Plan:', margin, yPos);
  yPos += lineHeight;
  doc.setFontSize(12);
  const treatmentLines = doc.splitTextToSize(recording.aiReport.treatment, pageWidth - margin * 2);
  treatmentLines.forEach(line => {
    doc.text(line, margin, yPos);
    yPos += lineHeight;
  });
  yPos += lineHeight;

  // Medications
  doc.setFontSize(14);
  doc.text('Medications:', margin, yPos);
  yPos += lineHeight;
  doc.setFontSize(12);
  recording.aiReport.medications.forEach(med => {
    doc.text(`• ${med.name} - ${med.dosage}, ${med.frequency}`, margin + 5, yPos);
    yPos += lineHeight;
  });
  yPos += lineHeight;

  // Follow-up
  doc.setFontSize(14);
  doc.text('Follow-up:', margin, yPos);
  yPos += lineHeight;
  doc.setFontSize(12);
  const followUpLines = doc.splitTextToSize(recording.aiReport.followUp, pageWidth - margin * 2);
  followUpLines.forEach(line => {
    doc.text(line, margin, yPos);
    yPos += lineHeight;
  });

  doc.save(`medical-report-${recording.patientName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
}

export async function exportToWord(recording: Recording) {
  if (!recording.aiReport) return;

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: 'Medical Report',
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 }
        }),

        // Patient Info
        new Paragraph({
          children: [
            new TextRun({ text: 'Patient: ', bold: true }),
            new TextRun(recording.patientName),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Doctor: ', bold: true }),
            new TextRun(recording.doctorName),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Date: ', bold: true }),
            new TextRun(recording.createdAt.toLocaleDateString()),
          ],
          spacing: { after: 200 }
        }),

        // Symptoms
        new Paragraph({
          text: 'Symptoms',
          heading: HeadingLevel.HEADING_2,
        }),
        ...recording.aiReport.symptoms.map(symptom => 
          new Paragraph({
            text: `• ${symptom}`,
            spacing: { after: 100 }
          })
        ),

        // Diagnosis
        new Paragraph({
          text: 'Diagnosis',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: recording.aiReport.diagnosis,
          spacing: { after: 200 }
        }),

        // Treatment
        new Paragraph({
          text: 'Treatment Plan',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: recording.aiReport.treatment,
          spacing: { after: 200 }
        }),

        // Medications
        new Paragraph({
          text: 'Medications',
          heading: HeadingLevel.HEADING_2,
        }),
        new Table({
          width: {
            size: 100,
            type: 'pct',
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: 'Medication', bold: true })] }),
                new TableCell({ children: [new Paragraph({ text: 'Dosage', bold: true })] }),
                new TableCell({ children: [new Paragraph({ text: 'Frequency', bold: true })] }),
              ],
            }),
            ...recording.aiReport.medications.map(med => 
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(med.name)] }),
                  new TableCell({ children: [new Paragraph(med.dosage)] }),
                  new TableCell({ children: [new Paragraph(med.frequency)] }),
                ],
              })
            ),
          ],
        }),

        // Follow-up
        new Paragraph({
          text: 'Follow-up',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200 }
        }),
        new Paragraph({
          text: recording.aiReport.followUp
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `medical-report-${recording.patientName.toLowerCase().replace(/\s+/g, '-')}.docx`);
}