export const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export const isValidOtp = (otp: string): boolean => {
    return /^\d{6}$/.test(otp);
}

export const tokenExpiry = () => {
    return new Date(Date.now() - 5 * 60 * 1000)
}
