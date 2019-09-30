const download = (data, w = window, d = document) => {
  const url = w.URL.createObjectURL(
    new Blob([new Uint8Array(data.buffer, 0, data.buffer.length)])
  );
  const tempLink = d.createElement('a');
  tempLink.href = url;
  tempLink.setAttribute('download', data.name);
  tempLink.click();
};

module.exports = download;