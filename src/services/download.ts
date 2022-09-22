
export const downloadBlob = (data: string | Uint8Array, fileName: string) => {
  const blob = new Blob([data], {
    type: 'application/octet-stream'
  });
  const url = window.URL.createObjectURL(blob);
  downloadURL(url, fileName);
  setTimeout(function() {
    return window.URL.revokeObjectURL(url);
  }, 1000);
};

function downloadURL(data: string, fileName: string) {
  var a;
  a = document.createElement('a');
  a.href = data;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
};