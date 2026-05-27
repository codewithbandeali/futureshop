import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        total: 0,
        cartItems: {},
        miniCartOpen: false,
    },
    reducers: {
        addToCart: (state, action) => {
            const { productId, openDrawer = true } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId]++
            } else {
                state.cartItems[productId] = 1
            }
            state.total += 1
            // Open the mini-cart drawer so the shopper sees what they added,
            // unless the caller explicitly opted out (e.g. quantity stepper
            // inside the drawer itself).
            if (openDrawer) state.miniCartOpen = true
        },
        removeFromCart: (state, action) => {
            const { productId } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId]--
                if (state.cartItems[productId] === 0) {
                    delete state.cartItems[productId]
                }
                state.total -= 1
            }
        },
        deleteItemFromCart: (state, action) => {
            const { productId } = action.payload
            state.total -= state.cartItems[productId] ? state.cartItems[productId] : 0
            delete state.cartItems[productId]
        },
        clearCart: (state) => {
            state.cartItems = {}
            state.total = 0
            state.miniCartOpen = false
        },
        openMiniCart: (state) => { state.miniCartOpen = true },
        closeMiniCart: (state) => { state.miniCartOpen = false },
        toggleMiniCart: (state) => { state.miniCartOpen = !state.miniCartOpen },
    },
})

export const {
    addToCart,
    removeFromCart,
    clearCart,
    deleteItemFromCart,
    openMiniCart,
    closeMiniCart,
    toggleMiniCart,
} = cartSlice.actions

export default cartSlice.reducer
