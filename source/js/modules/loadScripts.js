// если cdn недоступен, загружаем полифил локально
const loadFile = (file, cb) => {
  let fileRef = document.createElement('script');
  const removeItem = () => {
    fileRef.parentNode.removeChild(fileRef);
    fileRef = document.createElement('script');
    fileRef.type = 'text/javascript';
    fileRef.src = cb;
    document.getElementsByTagName('head')[0].appendChild(fileRef);
  };
  fileRef.type = 'text/javascript';
  fileRef.src = file;
  fileRef.onerror = removeItem;
  document.getElementsByTagName('head')[0].appendChild(fileRef);
};

// определяем, что браузер - ie11, загружаем полифил из cdn
if (/Trident.*rv:/.test(navigator.userAgent)) {
  loadFile(
    '//cdnjs.cloudflare.com/ajax/libs/picturefill/3.0.3/picturefill.min.js',
    'js/picturefill.min.js',
  );
  loadFile('//cdnjs.cloudflare.com/ajax/libs/svgxuse/1.2.6/svgxuse.min.js',
    'js/svgxuse.min.js');
}
