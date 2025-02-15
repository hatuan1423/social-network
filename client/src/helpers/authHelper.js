import { jwtDecode } from "jwt-decode";

export const handleDecoded = () => {
    let token = localStorage.getItem("token");
    let decoded = {};
    if (token) {
        decoded = jwtDecode(token);
    }
    return { decoded, token };
};