const Product = require('../models/product');



exports.getProducts = (req, res, next) => {
  Product.findAll()
  .then(products=>{
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',//right side is the "product" near prodId , left side "product" is the key on the templates
      path: '/products'//we want to mark the "navigation.ejs" as "active"
    });

})
.catch(err=>console.log(err));

};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  // Product.findAll({where:{id:prodId}}).then(products=>{
  //   res.render('shop/product-detail', {
  //     product: products[0],
  //     pageTitle: products[0].title,//right side is the "product" near prodId , left side "product" is the key on the templates
  //     path: '/products'//we want to mark the "navigation.ejs" as "active"
  //   });
  // }).catch(err=>console.log(err));

  Product.findByPk(prodId).then(product=>{
  
    
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,//right side is the "product" near prodId , left side "product" is the key on the templates
      path: '/products'//we want to mark the "navigation.ejs" as "active"
    });
  }).catch(err=>console.log(err));

};

exports.getIndex = (req, res, next) => {

  Product.findAll().then(products=>{
    res.render('shop/index', {
      prods: products,//rows are entries of the products table
      pageTitle: 'Shop',
      path: '/'
    });
  }).catch(err=>{
    console.log(err)
  });
  
};

exports.getCart = (req, res, next) => {
  
req.user.getCart().then(cart=>{
  console.log(cart);
  return cart.getProducts().then(products=>{
    res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: products//we have store the products and pass them to view
    })
  }).catch(err=>console.log(err));
}).catch(err=>console.log(err));


  // Cart.getCart(cart => {
  //   Product.fetchAll(products => {
  //     const cartProducts = [];
  //     for (product of products) {//looping in products
  //       const cartProductData = cart.products.find(
  //         prod => prod.id === product.id
  //       );
  //       if (cartProductData) {
  //         cartProducts.push({ productData: product, qty: cartProductData.qty });
  //       }
  //     }
  //     res.render('shop/cart', {
  //       path: '/cart',
  //       pageTitle: 'Your Cart',
  //       products: cartProducts
  //     });
  //   });
  // });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;//>"productId" is the name we use in input in "product-detail.ejs"
  let fetchedCart;
  let newQuantity=1;
  req.user.getCart()
  .then(cart => {
    fetchedCart = cart;
    return cart.getProducts({ where: { id: prodId } });
  })
  .then(products => {
    let product;
    if (products.length > 0) {
      product = products[0];
    }

    if (product) {
      const oldQuantity = product.cartItem.quantity;
      newQuantity = oldQuantity + 1;
      return product;
    }
    return Product.findByPk(prodId);
  })
  .then(product => {
    return fetchedCart.addProduct(product, {
      through: { quantity: newQuantity }
    });
  })
  .then(() => {
    res.redirect('/cart');
  })
  .catch(err => console.log(err));
  
  
  // Product.findById(prodId, product => {//we have to use product model(object) available in all the templates to use(access".product.price or product.desc") "productId"
  //   Cart.addProduct(prodId, product.price);
  // });
  // res.redirect('/cart');//with models/product
};

exports.postCartDeleteProduct = (req, res, next) => {
 const prodId=req.body.productId;  //we get productId by name in cart.ejs 
 req.user.getCart().then(cart=>{
  return cart.getProducts({where:{id:prodId}});
 }).then(products=>{
   const product=products[0];
   return product.cartItem.destroy();
 }).then(result=>{
  res.redirect('/cart');
 }).catch(err=>console.log(err))
};

exports.postOrder=(req,res,next)=>{
  let fetchedCart;
  req.user.getCart().then(cart=>{
    fetchedCart=cart;
    return cart.getProducts();
  }).then(products=>{
    return req.user.createOrder().then(order=>{
      order.addProducts(products.map(product=>{
        product.orderItem={quantity:product.cartItem.quantity};
        return product;
      }));
    }).catch(err=>console.log(err));
    
    
  }).then(result=>{
    fetchedCart.setProducts(null);
    
  }).then(result=>{
    res.redirect('/orders');
  })
  .catch(err=>console.log(err));
}

exports.getOrders = (req, res, next) => {
  req.user.getOrders({include:['products']}).then(orders=>{//we use products because in app.js(55) we assosiciate an order to many product in modal
  
    
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders:orders
    });
  }).catch(err=>console.log(err)
  );};







// exports.getCheckout = (req, res, next) => {
//   res.render('shop/checkout', {
//     path: '/checkout',
//     pageTitle: 'Checkout'
//   });
// };

