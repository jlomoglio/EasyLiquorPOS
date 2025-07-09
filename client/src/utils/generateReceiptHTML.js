export function generateReceiptHTML(data) {
	const {
	  transaction_id,
	  date,
	  time,
	  subtotal,
	  tax,
	  total_amount,
	  store_name,
	  store_address,
	  store_email,
	  store_phone,
	  items = [],
	} = data
  
	return `
	  <!DOCTYPE html>
	  <html>
	  <head>
		<style>
		  body {
			font-family: monospace;
			width: 384px;
			margin: 0;
			padding: 10px;
		  }
		  h2 { text-align: center; font-size: 16px; margin-bottom: 4px; }
		  .center { text-align: center; }
		  .right { text-align: right; }
		  hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
		  table { width: 100%; font-size: 12px; }
		  td { padding: 2px 0; }
		</style>
	  </head>
	  <body>
		<h2>${store_name}</h2>
		<div class="center">${store_address}</div>
		<div class="center">Email: ${store_email}</div>
		<div class="center">Phone: ${store_phone}</div>
		<hr />
		<div>Transaction: ${transaction_id}</div>
		<div>Date: ${date} ${time}</div>
		<hr />
		<table>
		  ${items.map(item => `
			<tr>
			  <td>${item.quantity}x</td>
			  <td>${item.product_name} ${item.volume}</td>
			  <td class="right">$${item.total}</td>
			</tr>`).join('')}
		</table>
		<hr />
		<div class="right">Subtotal: $${subtotal}</div>
		<div class="right">Tax: $${tax}</div>
		<div class="right"><strong>Total: $${total_amount}</strong></div>
		<hr />
		<div class="center">Thank you for your purchase!</div>
	  </body>
	  </html>
	`
  }
  
  