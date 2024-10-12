export const signup = async (request, response) => {
    return response.json({
        data: "You hit the signup endpoint"
    })
}

export const login = async (request, response) => {
    return response.json({
        data: "You hit the login endpoint"
    })
}

export const logout = async (request, response) => {
    return response.json({
        data: "You hit the logout endpoint"
    })
}