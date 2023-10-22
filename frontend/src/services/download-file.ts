export function downloadFile(content: string[], type: string, fileName: string) {
  const blob = new Blob(content, { type });
  const url = URL.createObjectURL(blob);
  const a: HTMLAnchorElement = document.createElement('a');
  a.href = url;
  a.download = fileName;
  // Trigger a click event on the anchor element
  a.click();
  URL.revokeObjectURL(url);
}
