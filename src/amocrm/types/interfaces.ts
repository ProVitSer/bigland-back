export interface AmocrmTokenResponse {
    token_type: string,
    expires_in: number,
    access_token: string,
    refresh_token: string,
    expires_at: number,
}