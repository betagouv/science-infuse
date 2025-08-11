# Obtaining and Using GAR Certificates

This document explains how to generate the files required to call the GAR web services:  

- **`cle_privee_gar.key`** — Your private key (keep this secret)  
- **`ada.csr`** — Certificate Signing Request (CSR) to send to GAR  
- **`certificat_gar.pem`** — Certificate returned by GAR, signed from your CSR  

---

## 1. Generate `cle_privee_gar.key` and `ada.csr`

> **Important:** Run this command **directly on the server** where the certificate will be used.  
> This ensures the private key never leaves the server, reducing the risk of compromise.

```bash
openssl req -new -newkey rsa:4096 -nodes \
  -subj "/CN=ada.beta.gouv.fr/O=MINISTERE DE L'EDUCATION NATIONALE ET DE LA JEUNESSE/OU=0002 110043015/OU=UNIQUEMENT POUR TEST/OU=Administration Centrale/OU=GAR EPPDCSI/emailAddress=isr-test@education.gouv.fr" \
  -keyout cle_privee_gar.key \
  -out ada.csr
```

This will create:  
- `cle_privee_gar.key` → Private key (**keep secure, never share**)  
- `ada.csr` → CSR to be sent to GAR for signing  

---

## 2. Send CSR to GAR

Send the file `ada.csr` to the GAR support/contact in charge of issuing your certificate.  

They will return a signed certificate in `.pem` or `.cer` format.  
Save it as:  

```
certificat_gar.pem
```

---

## 3. Use the certificate to call GAR web services

Update the following paths in `create-gar-subscriptions.ts` to match the location of your files:

```javascript
const CERT_PATH = './certs/certificat_gar.pem';
const KEY_PATH = './certs/cle_privee_gar.key';
```

---

## Security Notes

- **Never share** your private key (`cle_privee_gar.key`)  
- If the key is ever exposed, generate a new one and request a new certificate
