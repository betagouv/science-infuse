import { ChapterWithoutBlocks, UserFull } from "@/types/api"
import { sendMail } from "."
import { PROJECT_NAME } from "@/config";

const getTemplate = (chapterTitle: string, inspectChapterLink: string, userNameFull: string) => {
  return `<!DOCTYPE html>
<html
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <title>Inscription à ${PROJECT_NAME}</title>
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <!--<![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style type="text/css">
      #outlook a {
        padding: 0;
      }
      body {
        margin: 0;
        padding: 0;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      table,
      td {
        border-collapse: collapse;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      img {
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
        -ms-interpolation-mode: bicubic;
      }
      p {
        display: block;
        margin: 13px 0;
      }
    </style>
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:AllowPNG />
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <!--[if lte mso 11]>
      <style type="text/css">
        .mj-outlook-group-fix {
          width: 100% !important;
        }
      </style>
    <![endif]-->
    <style type="text/css">
      @media only screen and (min-width: 480px) {
        .mj-column-per-50 {
          width: 50% !important;
          max-width: 50%;
        }
        .mj-column-per-100 {
          width: 100% !important;
          max-width: 100%;
        }
      }
    </style>
    <style media="screen and (min-width:480px)">
      .moz-text-html .mj-column-per-50 {
        width: 50% !important;
        max-width: 50%;
      }
      .moz-text-html .mj-column-per-100 {
        width: 100% !important;
        max-width: 100%;
      }
    </style>
    <style type="text/css">
      [owa] .mj-column-per-50 {
        width: 50% !important;
        max-width: 50%;
      }
      [owa] .mj-column-per-100 {
        width: 100% !important;
        max-width: 100%;
      }
    </style>
    <style type="text/css">
      @media only screen and (max-width: 479px) {
        table.mj-full-width-mobile {
          width: 100% !important;
        }
        td.mj-full-width-mobile {
          width: auto !important;
        }
      }
    </style>
    <style type="text/css"></style>
  </head>
  <body style="word-spacing: normal; background-color: #f4f4f4">
    <div
      style="
        display: none;
        font-size: 1px;
        color: #ffffff;
        line-height: 1px;
        max-height: 0px;
        max-width: 0px;
        opacity: 0;
        overflow: hidden;
      "
    >
      Inscription à ${PROJECT_NAME}
    </div>
    <div style="background-color: #f4f4f4">
      <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#ffffff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
      <div
        style="
          background: #ffffff;
          background-color: #ffffff;
          margin: 0px auto;
          max-width: 600px;
        "
      >
        <table
          align="center"
          border="0"
          cellpadding="0"
          cellspacing="0"
          role="presentation"
          style="background: #ffffff; background-color: #ffffff; width: 100%"
        >
          <tbody>
            <tr>
              <td
                style="
                  direction: ltr;
                  font-size: 0px;
                  padding: 20px 0;
                  text-align: center;
                "
              >
                <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:300px;" ><![endif]-->
                <div
                  class="mj-column-per-50 mj-outlook-group-fix"
                  style="
                    font-size: 0px;
                    text-align: left;
                    direction: ltr;
                    display: inline-block;
                    vertical-align: top;
                    width: 100%;
                  "
                >
                  <table
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    role="presentation"
                    style="vertical-align: top"
                    width="100%"
                  >
                    <tbody>
                      <tr>
                        <td
                          align="center"
                          style="
                            font-size: 0px;
                            padding: 10px 25px;
                            word-break: break-word;
                          "
                        >
                          <table
                            border="0"
                            cellpadding="0"
                            cellspacing="0"
                            role="presentation"
                            style="
                              border-collapse: collapse;
                              border-spacing: 0px;
                            "
                          >
                            <tbody>
                              <tr>
                                <td style="width: 250px">
                                  <img
                                    alt="logo ${PROJECT_NAME}"
                                    src="https://sm1y1.mjt.lu/img2/sm1y1/934b4b5d-80e3-43f7-934d-90a13d997409/content"
                                    style="
                                      border: none;
                                      display: block;
                                      outline: none;
                                      text-decoration: none;
                                      height: auto;
                                      width: 100%;
                                      font-size: 13px;
                                    "
                                    width="250"
                                    height="auto"
                                  />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]></td><td class="" style="vertical-align:top;width:300px;" ><![endif]-->
                <div
                  class="mj-column-per-50 mj-outlook-group-fix"
                  style="
                    font-size: 0px;
                    text-align: left;
                    direction: ltr;
                    display: inline-block;
                    vertical-align: top;
                    width: 100%;
                  "
                >
                  <table
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    role="presentation"
                    style="vertical-align: top"
                    width="100%"
                  >
                    <tbody></tbody>
                  </table>
                </div>
                <!--[if mso | IE]></td></tr></table><![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#FFFFFF" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
      <div
        style="
          background: #ffffff;
          background-color: #ffffff;
          margin: 0px auto;
          max-width: 600px;
        "
      >
        <table
          align="center"
          border="0"
          cellpadding="0"
          cellspacing="0"
          role="presentation"
          style="background: #ffffff; background-color: #ffffff; width: 100%"
        >
          <tbody>
            <tr>
              <td
                style="
                  direction: ltr;
                  font-size: 0px;
                  padding: 20px 0;
                  text-align: center;
                "
              >
                <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                <div
                  class="mj-column-per-100 mj-outlook-group-fix"
                  style="
                    font-size: 0px;
                    text-align: left;
                    direction: ltr;
                    display: inline-block;
                    vertical-align: top;
                    width: 100%;
                  "
                >
                  <table
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    role="presentation"
                    style="vertical-align: top"
                    width="100%"
                  >
                    <tbody>
                      <tr>
                        <td
                          align="left"
                          style="
                            font-size: 0px;
                            padding: 10px 25px;
                            padding-top: 0px;
                            padding-bottom: 0px;
                            word-break: break-word;
                          "
                        >
                          <div
                            style="
                              font-family: Arial, sans-serif;
                              font-size: 13px;
                              letter-spacing: normal;
                              line-height: 1;
                              text-align: left;
                              color: #000000;
                            "
                          >
                            <h3
                              class="text-build-content"
                              style="
                                text-align: center;
                                margin-top: 10px;
                                margin-bottom: 10px;
                                font-weight: normal;
                              "
                            >
                              <span
                                style="
                                  color: #131b20;
                                  font-family: Tahoma;
                                  font-size: 24px;
                                  line-height: 28px;
                                "
                                ><b
                                  >Nouvelle demande de revue de chapitre.</b
                                ></span
                              >
                            </h3>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td
                          align="left"
                          style="
                            font-size: 0px;
                            padding: 10px 25px;
                            padding-top: 0px;
                            padding-bottom: 0px;
                            word-break: break-word;
                          "
                        >
                          <div
                            style="
                              font-family: Arial, sans-serif;
                              font-size: 13px;
                              letter-spacing: normal;
                              line-height: 1;
                              text-align: left;
                              color: #000000;
                            "
                          >
                            <h2
                              class="text-build-content"
                              style="
                                text-align: center;
                                margin-top: 10px;
                                margin-bottom: 10px;
                                font-weight: normal;
                              "
                            >
                              <span
                                style="
                                  color: #55575d;
                                  font-family: Arial, Helvetica, sans-serif;
                                  font-size: 18px;
                                "
                                ><b>« ${chapterTitle} »</b></span
                              >
                            </h2>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td
                          align="left"
                          style="
                            font-size: 0px;
                            padding: 10px 25px;
                            padding-top: 0px;
                            padding-bottom: 0px;
                            word-break: break-word;
                          "
                        >
                          <div
                            style="
                              font-family: Arial, sans-serif;
                              font-size: 13px;
                              letter-spacing: normal;
                              line-height: 1;
                              text-align: left;
                              color: #000000;
                            "
                          >
                            <p
                              class="text-build-content"
                              style="
                                text-align: center;
                                margin: 10px 0;
                                margin-top: 10px;
                              "
                            >
                              <span
                                style="
                                  color: #495a65;
                                  font-family: Arial;
                                  font-size: 16px;
                                "
                                >${userNameFull} a publié un nouveau
                                chapitre.</span
                              >
                            </p>
                            <p
                              class="text-build-content"
                              style="
                                text-align: center;
                                margin: 10px 0;
                                margin-bottom: 10px;
                              "
                            >
                              <span
                                style="
                                  color: #495a65;
                                  font-family: Arial;
                                  font-size: 16px;
                                "
                                >Cliquez sur le lien suivant pour
                                l'inspecter.</span
                              >
                            </p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td
                          align="center"
                          vertical-align="middle"
                          style="
                            font-size: 0px;
                            padding: 10px 25px;
                            word-break: break-word;
                          "
                        >
                          <table
                            border="0"
                            cellpadding="0"
                            cellspacing="0"
                            role="presentation"
                            style="border-collapse: separate; line-height: 100%"
                          >
                            <tbody>
                              <tr>
                                <td
                                  align="center"
                                  bgcolor="#000091"
                                  role="presentation"
                                  style="
                                    border: none;
                                    border-radius: 3px;
                                    cursor: auto;
                                    mso-padding-alt: 10px 25px;
                                    background: #000091;
                                  "
                                  valign="middle"
                                >
                                  <a
                                    href="${inspectChapterLink}"
                                    style="
                                      display: inline-block;
                                      background: #000091;
                                      color: #ffffff;
                                      font-family: Arial, sans-serif;
                                      font-size: 13px;
                                      font-weight: normal;
                                      line-height: 120%;
                                      margin: 0;
                                      text-decoration: none;
                                      text-transform: none;
                                      padding: 10px 25px;
                                      mso-padding-alt: 0px;
                                      border-radius: 3px;
                                    "
                                    target="_blank"
                                    ><span style="background-color: #000091"
                                      ><b>Inspecter le chapitre</b></span
                                    ></a
                                  >
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]></td></tr></table><![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
      <!--[if mso | IE]></td></tr></table><![endif]-->
    </div>
    <br /><a
      style="font-family: Arial, sans-serif"
      href="https://sm1y1.mjt.lu/lnk/BAAABinRNzMAAAAAAAAAAULVgYIAAYCuSdcAAAAAACeeXABnFlMGgaZLOFZRTnCB21Vh9TfHLAAkzh4/0/NzKLQWR-1lGXD6eRTORl5Q/aHR0cHM6Ly9zY2llbmNlLWluZnVzZS5iZXRhLmdvdXYuZnIv?b=1"
      >&#8203;</a
    >
    <div
      style="
        display: none;
        height: 0px;
        width: 0px;
        overflow: hidden;
        visibility: hidden;
        mso-hide: all;
      "
    >
      <a
        href="https://sm1y1.mjt.lu/lnk/BAAABinRNzMAAAAAAAAAAULVgYIAAYCuSdcAAAAAACeeXABnFlMGgaZLOFZRTnCB21Vh9TfHLAAkzh4/0/NzKLQWR-1lGXD6eRTORl5Q/aHR0cHM6Ly9zY2llbmNlLWluZnVzZS5iZXRhLmdvdXYuZnIv?b=2"
        target="_blank"
        rel="noreferrer"
        >Click on me</a
      >
    </div>
    <a
      href="https://sm1y1.mjt.lu/lnk/BAAABinRNzMAAAAAAAAAAULVgYIAAYCuSdcAAAAAACeeXABnFlMGgaZLOFZRTnCB21Vh9TfHLAAkzh4/0/NzKLQWR-1lGXD6eRTORl5Q/aHR0cHM6Ly9zY2llbmNlLWluZnVzZS5iZXRhLmdvdXYuZnIv?b=3"
    >
    </a>
  </body>
</html>
`
}

export default async function (to: UserFull[], chapter: ChapterWithoutBlocks) {
  if (!chapter) return;
  const inspectChapterLink = `${process.env.NEXT_PUBLIC_WEBAPP_URL}/admin/chapitres?q=${chapter.id}`;

  await sendMail(to, "Nouveau chapitre en revue", getTemplate(chapter?.title || "Chapitre sans titre", inspectChapterLink, `${chapter?.user.firstName} ${chapter?.user.lastName}`))
}