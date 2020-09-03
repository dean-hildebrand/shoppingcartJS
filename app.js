// variables

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBrn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
// cart items
let cart = [];
// buttons
let buttonsDOM = [];

// getting the products -------------------------------------------------------------------------------------------------------------------
class Products {
  // async await will ALWAYS return the promise. Chain .then. await key word waits until the promise is settled then returns the products
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items;
      products = products.map(item => {
        // destructuring the object
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}
// display products ------------------------------------------------------------------------------------------
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach(product => {
      result += `
      <!-- single product -->
      <article class="product">
        <div class="img-container">
          <img
            src=${product.image}
            alt="product"
            class="product-img"
          />
          <button class="bag-btn" data-id=${product.id}>
            <i class="fas fa-shopping-cart"></i>Add to cart
          </button>
        </div>
        <h3>${product.title}</h3>
        <h4>$${product.price}</h4>
      </article>
      <!-- end of single product -->
      `;
    });
    productsDOM.innerHTML = result;
  }
  getBagBtns() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    // using dataset attribute to get each buttons id
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }
      button.addEventListener("click", e => {
        button.innerText = "In Cart";
        button.disabled = true;
        // get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // add product to the cart
        cart = [...cart, cartItem];
        // save cart in localStorage
        Storage.saveCart(cart);
        // set cart values
        this.setCartValues(cart);
        // display cart item
        this.addCartItem(cartItem);
        // show the cart with overlay
        this.showCart(cart);
      });
    });
  }
  // adding price total and item total
  setCartValues(cart) {
    let tempTotal = 0;
    let itemTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemTotal += item.amount;
    });
    // toFixed to 2 decimal places
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemTotal;
  }
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
<img src=${item.image} alt="" />
<div>
  <h4>${item.title}</h4>
  <h5>$${item.price}</h5>
  <span class="remove-item" data-id=${item.id}>remove</span>
</div>
<div>
  <i class="fas fa-chevron-up" data-id=${item.id}></i>
  <p class="item-amount">${item.amount}</p>
  <i class="fas fa-chevron-down" data-id=${item.id}></i>
</div>
`;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  populateCart(cart) {
    cart.forEach(item => {
      this.addCartItem(item);
    });
  }
  cartLogic(cart) {
    // clear cart button
    clearCartBrn.addEventListener("click", () => {
      this.clearCart();
    });
    // cart functionality
  }
  clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart()
  }
  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }
  getSingleButton(id) {
    // find the button that was click to add that specific item to the cart
    return buttonsDOM.find(button => button.dataset.id === id);
  }
}
// local storage -------------------------------------------------------------------------------------------------------------
class Storage {
  // static method, don't need to to create an instance and can be used in other classes
  // using local storage to save that item
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  // setup App
  ui.setupApp();
  // get all products
  products
    .getProducts()
    .then(products => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagBtns();
      ui.cartLogic();
    });
});
