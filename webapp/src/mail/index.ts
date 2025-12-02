import { PROJECT_NAME } from '@/config'
import { UserFull } from '@/types/api'
import axios from 'axios'

interface GraphAPITokenResponse {
    access_token: string
    token_type: string
    expires_in: number
}

// Cache pour le token OAuth2 (pour éviter de le demander à chaque email)
let cachedToken: string | null = null
let tokenExpiry: number = 0

/**
 * Obtient un token OAuth2 depuis Microsoft Identity Platform
 */
async function getAccessToken(): Promise<string> {
    const tenantId = process.env.MICROSOFT_TENANT_ID
    const clientId = process.env.MICROSOFT_CLIENT_ID
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET

    if (!tenantId || !clientId || !clientSecret) {
        throw new Error('MICROSOFT_TENANT_ID, MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET must be set in environment variables')
    }

    // Réutiliser le token en cache s'il est encore valide (avec 5 min de marge)
    const now = Date.now()
    if (cachedToken && tokenExpiry > now + 5 * 60 * 1000) {
        return cachedToken
    }

    try {
        const params = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            scope: 'https://graph.microsoft.com/.default',
            grant_type: 'client_credentials'
        })

        const response = await axios.post<GraphAPITokenResponse>(
            `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
            params.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        )

        cachedToken = response.data.access_token
        tokenExpiry = now + response.data.expires_in * 1000

        return cachedToken
    } catch (error) {
        console.error('Error getting access token:', error)
        throw new Error('Failed to authenticate with Microsoft Graph API')
    }
}

/**
 * Envoie un email via Microsoft Graph API
 */
export async function sendMail(to: UserFull[], subject: string, html: string): Promise<void> {
    if (to.length === 0) return

    const senderEmail = process.env.MICROSOFT_SENDER_EMAIL || 'ada@universcience.fr'

    try {
        // Obtenir le token d'accès OAuth2
        const accessToken = await getAccessToken()

        // Préparer les destinataires
        const recipients = to
            .filter(user => user.email !== null)
            .map(user => ({
                emailAddress: {
                    address: user.email as string,
                    name: `${user.firstName} ${user.lastName}`
                }
            }))

        // Construire le message au format Graph API
        const message = {
            message: {
                subject: subject,
                body: {
                    contentType: 'HTML',
                    content: html
                },
                toRecipients: recipients,
                from: {
                    emailAddress: {
                        address: senderEmail,
                        name: PROJECT_NAME
                    }
                }
            },
            saveToSentItems: false // Pas besoin de sauvegarder dans "Éléments envoyés"
        }

        // Envoyer l'email via Graph API
        await axios.post(
            `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`,
            message,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        )

        console.log('Email sent successfully via Microsoft Graph API')
    } catch (error) {
        console.error('Error sending email:', error)
        if (axios.isAxiosError(error) && error.response) {
            console.error('Graph API error details:', error.response.data)
        }
        throw error
    }
}