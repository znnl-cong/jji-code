import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

export async function fillDocxTemplate(
  docxBuffer: Buffer,
  data: Record<string, string>
): Promise<Buffer> {
  const zip = new PizZip(docxBuffer);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{{', end: '}}' },
    nullGetter: () => '',
  });

  doc.render(data);

  const output = doc.getZip().generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });

  return Buffer.from(output);
}
