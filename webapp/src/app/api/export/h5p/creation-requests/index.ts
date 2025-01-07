export const createH5P = async (data: any) => {
    const response = await fetch(`${process.env.H5P_URL}/h5p/new`, {
        "headers": {
            "accept": "*/*",
            "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
            "content-type": "application/json",
            "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Linux\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
            "Referer": `${process.env.H5P_URL}/h5p/new`,
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": JSON.stringify(data),
        "method": "POST"
    });
    return await response.json();
}
