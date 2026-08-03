export const orderConfirmationTemplate = (customerName: string, orderId: string, total: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="font-family: monospace; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #000000;">
    <div style="background-color: #000000; color: #ffffff; padding: 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">VERTIKAL ORIGINALS</h1>
    </div>
    <div style="padding: 30px;">
      <h2 style="font-size: 18px; text-transform: uppercase; margin-bottom: 20px;">ORDER CONFIRMED</h2>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        HEY ${customerName.toUpperCase()},
      </p>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        YOUR ORDER #${orderId.toUpperCase()} HAS BEEN RECEIVED.
      </p>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        TOTAL: ${total}
      </p>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        WE'LL NOTIFY YOU WHEN YOUR ORDER SHIPS.
      </p>
      <div style="border-top: 2px solid #000000; padding-top: 20px; margin-top: 30px;">
        <p style="font-size: 12px; text-transform: uppercase; margin: 0;">
          QUESTIONS? REPLY TO THIS EMAIL OR CONTACT US AT SUPPORT@VERTIKALORIGINALS.COM
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`

export const orderStatusUpdateTemplate = (customerName: string, orderId: string, status: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Status Update</title>
</head>
<body style="font-family: monospace; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #000000;">
    <div style="background-color: #000000; color: #ffffff; padding: 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">VERTIKAL ORIGINALS</h1>
    </div>
    <div style="padding: 30px;">
      <h2 style="font-size: 18px; text-transform: uppercase; margin-bottom: 20px;">ORDER UPDATE</h2>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        HEY ${customerName.toUpperCase()},
      </p>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        YOUR ORDER #${orderId.toUpperCase()} IS NOW: ${status.toUpperCase()}
      </p>
      <div style="border-top: 2px solid #000000; padding-top: 20px; margin-top: 30px;">
        <p style="font-size: 12px; text-transform: uppercase; margin: 0;">
          QUESTIONS? REPLY TO THIS EMAIL OR CONTACT US AT SUPPORT@VERTIKALORIGINALS.COM
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`

export const newOrderNotificationTemplate = (orderId: string, customerName: string, customerEmail: string, total: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order Received</title>
</head>
<body style="font-family: monospace; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #000000;">
    <div style="background-color: #000000; color: #ffffff; padding: 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">VERTIKAL ORIGINALS</h1>
    </div>
    <div style="padding: 30px;">
      <h2 style="font-size: 18px; text-transform: uppercase; margin-bottom: 20px;">NEW ORDER RECEIVED</h2>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 10px;">
        ORDER ID: #${orderId.toUpperCase()}
      </p>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 10px;">
        CUSTOMER: ${customerName.toUpperCase()}
      </p>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 10px;">
        EMAIL: ${customerEmail.toLowerCase()}
      </p>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        TOTAL: ${total}
      </p>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        LOG INTO THE ADMIN DASHBOARD TO PROCESS THIS ORDER.
      </p>
    </div>
  </div>
</body>
</html>
`

export const welcomeEmailTemplate = (customerName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to VERTIKAL Originals</title>
</head>
<body style="font-family: monospace; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #000000;">
    <div style="background-color: #000000; color: #ffffff; padding: 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">VERTIKAL ORIGINALS</h1>
    </div>
    <div style="padding: 30px;">
      <h2 style="font-size: 18px; text-transform: uppercase; margin-bottom: 20px;">WELCOME</h2>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        HEY ${customerName.toUpperCase()},
      </p>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        WELCOME TO VERTIKAL ORIGINALS. YOU'RE NOW PART OF THE MOVEMENT.
      </p>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        START SHOPPING THE LATEST DROPS AND STAY TUNED FOR EXCLUSIVE RELEASES.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products" style="background-color: #000000; color: #ffffff; padding: 15px 30px; text-decoration: none; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; display: inline-block;">SHOP NOW</a>
      </div>
      <div style="border-top: 2px solid #000000; padding-top: 20px; margin-top: 30px;">
        <p style="font-size: 12px; text-transform: uppercase; margin: 0;">
          FOLLOW US @VERTIKALORIGINALS_ ON INSTAGRAM
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`
