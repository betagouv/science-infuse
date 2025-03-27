import { UserFull } from "@/types/api"
import { sendMail } from "."
import { PROJECT_NAME } from "@/config"

const getTemplate = () => {
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
      ul {
        padding: 1rem;
      }
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
        .mj-column-per-67 {
          width: 67% !important;
          max-width: 67%;
        }
        .mj-column-per-33 {
          width: 33% !important;
          max-width: 33%;
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
      .moz-text-html .mj-column-per-67 {
        width: 67% !important;
        max-width: 67%;
      }
      .moz-text-html .mj-column-per-33 {
        width: 33% !important;
        max-width: 33%;
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
      [owa] .mj-column-per-67 {
        width: 67% !important;
        max-width: 67%;
      }
      [owa] .mj-column-per-33 {
        width: 33% !important;
        max-width: 33%;
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
                                      font-size: 16px;
                                      line-height: 1.5rem;
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
                              font-size: 16px;
                              line-height: 1.5rem;
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
                                ><b>Bienvenue sur ${PROJECT_NAME}</b></span
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
                              font-size: 16px;
                              line-height: 1.5rem;
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
                                  color: #000000;
                                  font-family: Arial;
                                  font-size: 16px;
                                  line-height: 1.5rem;
                                "
                                >Votre compte ${PROJECT_NAME} a bien été
                                créé.</span
                              >
                            </p>
                            <p
                              class="text-build-content"
                              style="text-align: center; margin: 10px 0"
                            >
                              <span
                                style="
                                  color: #000000;
                                  font-family: Arial;
                                  font-size: 16px;
                                  line-height: 1.5rem;
                                "
                                >Vous pouvez vous connecter en cliquant sur le
                                lien suivant.</span
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
                              &nbsp;
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
                                    href="https://science-infuse.beta.gouv.fr/connexion"
                                    style="
                                      display: inline-block;
                                      background: #000091;
                                      color: #ffffff;
                                      font-family: Arial, sans-serif;
                                      font-size: 16px;
                                      line-height: 1.5rem;
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
                                      ><b>Accéder à ${PROJECT_NAME}</b></span
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
      <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#e8edff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
      <div
        style="
          background: #e8edff;
          background-color: #e8edff;
          margin: 0px auto;
          max-width: 600px;
          padding: 2rem 0rem;
        "
      >
        <table
          align="center"
          border="0"
          cellpadding="0"
          cellspacing="0"
          role="presentation"
          style="background: #e8edff; background-color: #e8edff; width: 100%"
        >
          <tbody>
            <tr>
              <td
                style="
                  direction: ltr;
                  font-size: 0px;
                  padding: 0px 0px 0px 0px;
                  text-align: center;
                "
              >
                <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:middle;width:402px;" ><![endif]-->
                <div
                  class="mj-column-per-67 mj-outlook-group-fix"
                  style="
                    font-size: 0px;
                    text-align: left;
                    direction: ltr;
                    display: inline-block;
                    vertical-align: middle;
                    width: 100%;
                  "
                >
                  <table
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    role="presentation"
                    style="vertical-align: middle"
                    width="100%"
                  >
                    <tbody>
                      <tr>
                        <td
                          align="left"
                          style="
                            font-size: 0px;
                            padding: 10px 25px;
                            padding-top: 20px;
                            padding-bottom: 0px;
                            word-break: break-word;
                          "
                        >
                          <div
                            style="
                              font-family: Verdana, Helvetica, Arial, sans-serif;
                              font-size: 16px;
                              line-height: 1.5rem;
                              line-height: 1;
                              text-align: left;
                              color: #000000;
                            "
                          >
                            <h1
                              class="text-build-content"
                              style="margin-top: 10px; font-weight: normal"
                            >
                              <span
                                style="
                                  color: #000000;
                                  font-family: Arial, Helvetica, sans-serif;
                                  font-size: 20px;
                                "
                                ><b>Catalogue de cours</b></span
                              >
                            </h1>
                            <ul>
                              <li>
                                <span
                                  style="
                                    color: #000000;
                                    font-family: Arial;
                                    font-size: 16px;
                                    line-height: 1.5rem;
                                  "
                                  >Adaptés au programme de SVT du cycle 4</span
                                >
                              </li>
                              <li>
                                <span
                                  style="
                                    color: #000000;
                                    font-family: Arial;
                                    font-size: 16px;
                                    line-height: 1.5rem;
                                  "
                                  >Créés et validés par des enseignants de
                                  l’Éducation Nationale</span
                                >
                              </li>
                              <li>
                                <span
                                  style="
                                    color: #000000;
                                    font-family: Arial;
                                    font-size: 16px;
                                    line-height: 1.5rem;
                                  "
                                  >Exportables dans votre ENT (environnement
                                  numérique de travail)</span
                                >
                              </li>
                              <li>
                                <span
                                  style="
                                    color: #000000;
                                    font-family: Arial;
                                    font-size: 16px;
                                    line-height: 1.5rem;
                                  "
                                  >Editables pour s’adapter à votre manière
                                  d’enseigner</span
                                >
                              </li>
                            </ul>
                            <p
                              class="text-build-content"
                              style="margin: 10px 0; margin-bottom: 10px"
                            >
                              &nbsp;
                            </p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]></td><td class="" style="vertical-align:middle;width:198px;" ><![endif]-->
                <div
                  class="mj-column-per-33 mj-outlook-group-fix"
                  style="
                    font-size: 0px;
                    text-align: left;
                    direction: ltr;
                    display: inline-block;
                    vertical-align: middle;
                    width: 100%;
                  "
                >
                  <table
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    role="presentation"
                    style="vertical-align: middle"
                    width="100%"
                  >
                    <tbody>
                      <tr>
                        <td
                          align="center"
                          style="
                            font-size: 0px;
                            padding: 20px 20px 20px 0px;
                            padding-top: 20px;
                            padding-bottom: 20px;
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
                                <td style="width: 178px">
                                  <img
                                    alt="Carte cours"
                                    src="https://sm1y1.mjt.lu/img2/sm1y1/a855be00-92e6-4f26-b5f5-e50ab014827a/content"
                                    style="
                                      border: none;
                                      border-radius: px;
                                      display: block;
                                      outline: none;
                                      text-decoration: none;
                                      height: auto;
                                      width: 100%;
                                      font-size: 16px;
                                      line-height: 1.5rem;
                                    "
                                    width="178"
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
                <!--[if mso | IE]></td></tr></table><![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#ffffff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
      <div
        style="
          background: #ffffff;
          background-color: #ffffff;
          padding: 2rem 0rem;
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
                  direction: rtl;
                  font-size: 0px;
                  padding: 0px 0px 0px 0px;
                  text-align: center;
                "
              >
                <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:middle;width:402px;" ><![endif]-->
                <div
                  class="mj-column-per-67 mj-outlook-group-fix"
                  style="
                    font-size: 0px;
                    text-align: left;
                    direction: ltr;
                    display: inline-block;
                    vertical-align: middle;
                    width: 100%;
                  "
                >
                  <table
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    role="presentation"
                    style="vertical-align: middle"
                    width="100%"
                  >
                    <tbody>
                      <tr>
                        <td
                          align="left"
                          style="
                            font-size: 0px;
                            padding: 10px 25px;
                            padding-top: 20px;
                            padding-bottom: 0px;
                            word-break: break-word;
                          "
                        >
                          <div
                            style="
                              font-family: Verdana, Helvetica, Arial, sans-serif;
                              font-size: 16px;
                              line-height: 1.5rem;
                              line-height: 1;
                              text-align: left;
                              color: #000000;
                            "
                          >
                            <h1
                              class="text-build-content"
                              style="margin-top: 10px; font-weight: normal"
                            >
                              <span
                                style="
                                  color: #000000;
                                  font-family: Arial, Helvetica, sans-serif;
                                  font-size: 20px;
                                "
                                ><b
                                  >Recherche d'images, vidéos, documents...</b
                                ></span
                              >
                            </h1>
                            <ul>
                              <li>
                                <span
                                  style="
                                    color: #000000;
                                    font-family: Arial;
                                    font-size: 16px;
                                    line-height: 1.5rem;
                                    line-height: 1.5rem;
                                  "
                                  >Dans la base de données de la Cité des
                                  sciences et de l'industrie, du Palais de la
                                  découverte et de leurs partenaires</span
                                >
                              </li>
                              <li>
                                <span
                                  style="
                                    color: #000000;
                                    font-family: Arial;
                                    font-size: 16px;
                                    line-height: 1.5rem;
                                    line-height: 1.5rem;
                                  "
                                  >Gratuit et libre d'utilisation dans le cadre
                                  de vos cours</span
                                >
                              </li>
                            </ul>
                            <p
                              class="text-build-content"
                              style="margin: 10px 0; margin-bottom: 10px"
                            >
                              &nbsp;
                            </p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]></td><td class="" style="vertical-align:middle;width:198px;" ><![endif]-->
                <div
                  class="mj-column-per-33 mj-outlook-group-fix"
                  style="
                    font-size: 0px;
                    text-align: left;
                    direction: ltr;
                    display: inline-block;
                    vertical-align: middle;
                    width: 100%;
                  "
                >
                  <table
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    role="presentation"
                    style="vertical-align: middle"
                    width="100%"
                  >
                    <tbody>
                      <tr>
                        <td
                          align="center"
                          style="
                            font-size: 0px;
                            padding: 20px 0px 20px 25px;
                            padding-top: 20px;
                            padding-right: 0px;
                            padding-bottom: 20px;
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
                                <td style="width: 173px">
                                  <img
                                    alt=""
                                    src="https://science-infuse.beta.gouv.fr/_next/image?url=%2Fimages%2Fhome%2Fsection-2.png&w=3840&q=75"
                                    style="
                                      border: none;
                                      border-radius: px;
                                      display: block;
                                      outline: none;
                                      text-decoration: none;
                                      height: auto;
                                      width: 100%;
                                      font-size: 16px;
                                      line-height: 1.5rem;
                                    "
                                    width="173"
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
                <!--[if mso | IE]></td></tr></table><![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#e8edff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
      <div
        style="
          background: #e8edff;
          background-color: #e8edff;
          margin: 0px auto;
          max-width: 600px;
          padding: 2rem 0rem;
        "
      >
        <table
          align="center"
          border="0"
          cellpadding="0"
          cellspacing="0"
          role="presentation"
          style="background: #e8edff; background-color: #e8edff; width: 100%"
        >
          <tbody>
            <tr>
              <td
                style="
                  direction: ltr;
                  font-size: 0px;
                  padding: 0px 0px 0px 0px;
                  text-align: center;
                "
              >
                <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:middle;width:300px;" ><![endif]-->
                <div
                  class="mj-column-per-50 mj-outlook-group-fix"
                  style="
                    font-size: 0px;
                    text-align: left;
                    direction: ltr;
                    display: inline-block;
                    vertical-align: middle;
                    width: 100%;
                  "
                >
                  <table
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    role="presentation"
                    style="vertical-align: middle"
                    width="100%"
                  >
                    <tbody>
                      <tr>
                        <td
                          align="left"
                          style="
                            font-size: 0px;
                            padding: 10px 25px;
                            padding-top: 20px;
                            padding-bottom: 0px;
                            word-break: break-word;
                          "
                        >
                          <div
                            style="
                              font-family: Verdana, Helvetica, Arial, sans-serif;
                              font-size: 16px;
                              line-height: 1.5rem;
                              line-height: 1;
                              text-align: left;
                              color: #000000;
                            "
                          >
                            <h1
                              class="text-build-content"
                              style="
                                margin-top: 10px;
                                margin-bottom: 10px;
                                font-weight: normal;
                              "
                            >
                              <span
                                style="
                                  color: #000000;
                                  font-family: Arial, Helvetica, sans-serif;
                                  font-size: 20px;
                                "
                                ><b>Création de cours</b></span
                              >
                            </h1>
                            <ul>
                              <li>
                                <span
                                  style="
                                    color: #000000;
                                    font-family: Arial, Helvetica, sans-serif;
                                    font-size: 16px;
                                    line-height: 1.5rem;
                                  "
                                  >Rédigez les textes, choisissez parmi nos
                                  propres contenus validés, créez vos quiz,
                                  flashcards (carte de mémorisation) etc.</span
                                >
                              </li>
                              <li>
                                <span
                                  style="
                                    color: #000000;
                                    font-family: Arial, Helvetica, sans-serif;
                                    font-size: 16px;
                                    line-height: 1.5rem;
                                  "
                                  >Exportables dans votre ENT (environnement
                                  numérique de travail)</span
                                >
                              </li>
                              <li>
                                <span
                                  style="
                                    color: #000000;
                                    font-family: Arial, Helvetica, sans-serif;
                                    font-size: 16px;
                                    line-height: 1.5rem;
                                  "
                                  >Partageables avec la communauté Science
                                  Infuse si vous le souhaitez</span
                                >
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]></td><td class="" style="vertical-align:middle;width:300px;" ><![endif]-->
                <div
                  class="mj-column-per-50 mj-outlook-group-fix"
                  style="
                    font-size: 0px;
                    text-align: left;
                    direction: ltr;
                    display: inline-block;
                    vertical-align: middle;
                    width: 100%;
                  "
                >
                  <table
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    role="presentation"
                    style="vertical-align: middle"
                    width="100%"
                  >
                    <tbody>
                      <tr>
                        <td
                          align="center"
                          style="
                            font-size: 0px;
                            padding: 20px 25px 20px 0px;
                            padding-top: 20px;
                            padding-bottom: 20px;
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
                                <td style="width: 275px">
                                  <img
                                    alt="Carte cours"
                                    src="https://sm1y1.mjt.lu/img2/sm1y1/e324ad00-f9b6-42af-903d-71464e87244e/content"
                                    style="
                                      border: none;
                                      border-radius: px;
                                      display: block;
                                      outline: none;
                                      text-decoration: none;
                                      height: auto;
                                      width: 100%;
                                      font-size: 16px;
                                      line-height: 1.5rem;
                                    "
                                    width="275"
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
      href="https://sm1y1.mjt.lu/lnk/CAAABimVlmIAAAAAAAAAAULVgYIAAYCuSdcAAAAAACeeXABnFhpEnTJkEww-RN6VE5UbZKiy2wAkzh4/0/gYqtPpRsxp3ljyxsMXmncg/aHR0cHM6Ly9zY2llbmNlLWluZnVzZS5iZXRhLmdvdXYuZnIv?b=1"
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
        href="https://sm1y1.mjt.lu/lnk/CAAABimVlmIAAAAAAAAAAULVgYIAAYCuSdcAAAAAACeeXABnFhpEnTJkEww-RN6VE5UbZKiy2wAkzh4/0/gYqtPpRsxp3ljyxsMXmncg/aHR0cHM6Ly9zY2llbmNlLWluZnVzZS5iZXRhLmdvdXYuZnIv?b=2"
        target="_blank"
        rel="noreferrer"
        >Click on me</a
      >
    </div>
    <a
      href="https://sm1y1.mjt.lu/lnk/CAAABimVlmIAAAAAAAAAAULVgYIAAYCuSdcAAAAAACeeXABnFhpEnTJkEww-RN6VE5UbZKiy2wAkzh4/0/gYqtPpRsxp3ljyxsMXmncg/aHR0cHM6Ly9zY2llbmNlLWluZnVzZS5iZXRhLmdvdXYuZnIv?b=3"
    >
      <img
        src="https://sm1y1.mjt.lu/oo/CAAABimVlmIAAAAAAAAAAULVgYIAAYCuSdcAAAAAACeeXABnFhpEnTJkEww-RN6VE5UbZKiy2wAkzh4/fa79058e/e.gif"
        height="1"
        width="1"
        alt=""
        border="0"
        style="height: 1px; width: 1px; border: 0"
      />
    </a>
  </body>
</html>`
}

export const sendMailCreated = async (to: UserFull) => {
  await sendMail([to], `Inscription à ${PROJECT_NAME}`, getTemplate())
}