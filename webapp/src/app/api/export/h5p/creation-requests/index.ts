export const createH5P = async (data: any, h5pContentId?: string) => {
    const url = h5pContentId ? `${process.env.NEXT_PUBLIC_H5P_URL}/h5p/edit/${h5pContentId}` : `${process.env.NEXT_PUBLIC_H5P_URL}/h5p/`;
    console.log("URL:", url);

    const response = await fetch(url, {
        "headers": {
            "accept": "*/*",
            "accept-language": "fr-FR,fr;q=0.9",
            "content-type": "application/json",
            // "csrf-token": "vRH5DisN-uWvCrPFo8xGy_QoAc1og8BJLEFyowDut9UIa3BbfMCA",
            "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Linux\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            // "cookie": "next-auth.csrf-token=eb8cb901dd6623d31b1872d59e5c70a5a13b627a38718a0ef97e231c2f123851%7C2764e5a4edd0dab01949be35cdb8ad102cddae2fb380348957a145101df87ec0; _csrf=FSd_GOJtRAuh5cBWKIVrNX1t; next-auth.callback-url=http%3A%2F%2Fada.localhost%2Fconnexion; next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..oFoqCaJQuQNIwfyI.lpgidxMeTQqTVOqUbRF1ei_YB1GFlQtH7kcn7xxL6GjlvUGoXrUMYYCULE74ymO1g7vOcItBtJ36CIdQYf9tNk20qzXbWwPYHw3wMwS_V2XHdlgU6pgjU3bDZ3948GfDOmjP18vyGR5xyxG9i-8u7mGwqtaIPIrUUqYzLZSJbtNSKcgmERBp955pYKSV5shY9yNOSzpC36ASNJrhxNMJMlqO8uKT4UX0GOunmiuEh4CzmluUeN0FDWX8qtJPl3teqT0iyvY7hkJ6j3PnX_pAXMQQLFm8DxnlgizDUTGEFlfc3nRFr8thV97R2daC-YefM7kowPUHgX4nDjOgOHVuCnO2lEoV.4l8wFTCjoZDlYXKR7wXfyg; XSRF-TOKEN=SirY2aWr-ChB6Lxmn6-Q-70MOCGCCzHpBeJzRcm47usmeT11pgiA",
            "Referer": "http://ada.localhost/interactif/test",
            "Referrer-Policy": "strict-origin-when-cross-origin"
          },
        "body": JSON.stringify({...data, ada_h5p_secret: process.env.ADA_H5P_SECRET}),
        "method": "POST"
    });
    const json = await response.json();
    console.log("JSON:", json);
    return await json;
}
