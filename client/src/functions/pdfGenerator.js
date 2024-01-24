import { jsPDF } from "jspdf";

const downloadPdf = (chats, name, text) => {
  const doc = new jsPDF();
  // Set background colour
  const backgroundColor = [26, 54, 26];
  doc.setFillColor(...backgroundColor);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, "F");

  let yPosition = 40; // Initial Y position for first line of text
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const maxWidth = pageWidth - margin * 2; // Maximum width of text per line
  const textWidth = doc.getTextWidth(text);

  doc.setTextColor("white");
  doc.setFontSize(20);
  doc.text("Healio", (pageWidth - 15 - textWidth) / 2, 20);

  chats.forEach((chat) => {
    doc.setFontSize(14);
    doc.setTextColor("black");
    // Add user prompt to PDF
    let lines = doc.splitTextToSize(`You: ${chat.prompt}`, maxWidth);
    doc.text(lines, margin, yPosition);
    yPosition += (lines.length + 0.5) * 7; // Increment Y position for spacing

    // Add Healio response to PDF, ensuring HTML tags are removed
    let responseText = chat.response.replace(/<[^>]*>?/gm, ""); // Remove HTML tags
    lines = doc.splitTextToSize(`Healio: ${responseText}`, maxWidth);
    doc.text(lines, margin, yPosition);
    yPosition += (lines.length + 0.5) * 7; // Increment Y position for spacing

    // Check if we need to add a new page
    if (yPosition >= doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPosition = 10; // Reset Y position for the new page
    }
  });

  doc.save(name);
};

export { downloadPdf };
