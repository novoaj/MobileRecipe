const initialState = {
    user: null,
    authenticated: false,
    savedRecipes: []
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
        case 'SAVE_RECIPE':
            return {
                ...state,
                savedRecipes: [...state.savedRecipes, action.recipe]
            };
        case 'SET_SAVED_RECIPES':
            return {
                ...state,
                savedRecipes: action.recipes,
            }
        default:
            return state;
    }
}
export default userReducer;