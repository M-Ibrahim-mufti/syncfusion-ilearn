import { environment } from "../environments/environment";

export function getTokenRefreshTimeOut(tokenExpiry: number): number {
    const expires = new Date(tokenExpiry * 1000);
    const refreshTokenInXSeconds: number = expires.getTime() - Date.now() - (environment.REFRESH_TOKEN_X_SECONDS_BEFORE_EXPIRY * 1000);
    return refreshTokenInXSeconds;
}

export function blobToFile(blob: Blob, fileName: string, lastModified: number): File {
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    var file = new File([blob], fileName, { lastModified: lastModified });
    return file;
}

export function copyToClipboard(textToCopy: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = textToCopy;
    // Make sure the textarea is not visible
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';

    document.body.appendChild(textarea);
    // Select and copy the text inside the textarea
    textarea.select();
    document.execCommand('copy');
    // Clean up: remove the textarea from the DOM
    document.body.removeChild(textarea);
}