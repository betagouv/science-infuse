export const extractYoutubeVideoId = (url: string): string => {
    let ID: string = '';
    const _url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if(_url[2] !== undefined) {
      ID = _url[2].split(/[^0-9a-z_\-]/i)[0];
    }
    else {
      ID = _url[0];
    }
      return ID;
  }
  