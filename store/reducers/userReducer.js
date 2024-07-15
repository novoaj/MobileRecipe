const initialState = {
    user: null,
    authenticated: false
}

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_USER':
            return {
                ...state,
                user: action.user,
                authenticated: true,
            };
        case 'LOGOUT_USER':
            return {
                ...state,
                user: null,
                authenticated: false,
            };
        default:
            return state;
    }
}
export default userReducer;