import { useMutation } from '@tanstack/react-query';

const useUploadFile = () => {
  return useMutation({
    mutationFn: (file: File) => {
      const myHeaders = new Headers();
      myHeaders.append('X-Frappe-CSRF-Token', window?.frappe?.csrf_token);

      const formdata = new FormData();

      formdata.append('file', file, file.name);

      return window.fetch('/api/method/upload_file', {
          method: 'POST',
          headers: myHeaders,
          body: formdata,
        })
        .then((res) => {
          return res.json();
        });
    },
  });
};

export default useUploadFile;
