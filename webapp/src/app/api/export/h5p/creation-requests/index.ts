export const createH5P = async (data: any, h5pContentId?: string) => {
    const url = h5pContentId ? `${process.env.NEXT_PUBLIC_H5P_URL}/h5p/${h5pContentId}` : `${process.env.NEXT_PUBLIC_H5P_URL}/h5p/`;
    const method = h5pContentId ? "PATCH" : "POST";

    const response = await fetch(url, {
        "headers": {
            "accept": "*/*",
            "accept-language": "fr-FR,fr;q=0.9",
            "content-type": "application/json",
            "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Linux\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "Referer": "http://ada.localhost/interactif/test",
            "Referrer-Policy": "strict-origin-when-cross-origin"
          },
        "body": JSON.stringify({...data, ada_h5p_secret: process.env.ADA_H5P_SECRET}),
        "method": method
    });
    const json = await response.json();
    return await json;
}
