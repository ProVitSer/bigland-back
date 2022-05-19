import { HttpStatus } from "@nestjs/common"

export interface IHttpResponse {
    status: HttpStatus,
    message?: string | Array<string> | Object,
    result?: string | Object | null,
    error?: string,
    data?: string | Object | null,
    timestamp: string,
    createdBy: string,
}