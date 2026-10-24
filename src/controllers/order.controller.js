const prisma = require('../configs/prisma');

const createOrder = async (req, res) => {
  try {
    const userId = req.user.uid; // Lấy uid từ token JWT đã giải mã
    const { items } = req.body; // Mảng sản phẩm mua, ví dụ: [{ pid: 1, qty: 2 }, { pid: 2, qty: 5 }]

    if (!items || items.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No items in order!' });
    }

    // Sử dụng Transaction để đảm bảo tính toàn vẹn dữ liệu (trừ kho và tạo đơn đồng thời)
    const result = await prisma.$transaction(async (prisma) => {
      let totalAmount = 0;

      // 1. Kiểm tra và tính tổng tiền, đồng thời trừ kho sản phẩm
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { pid: item.pid }
        });

        if (!product) {
          throw new Error(`Product with ID ${item.pid} not found!`);
        }

        if (product.quantity < item.qty) {
          throw new Error(`Product ${product.pname} is out of stock!`);
        }

        totalAmount += Number(product.price) * item.qty;

        // Trừ số lượng tồn kho
        await prisma.product.update({
          where: { pid: item.pid },
          data: { quantity: product.quantity - item.qty }
        });
      }

      // 2. Tạo Order (lấy thời gian hiện hành)
      const newOrder = await prisma.order.create({
        data: {
          uid: userId,
          order_date: new Date(),
          total_price: totalAmount
        }
      });

      // 3. Tạo OrderDetail cho từng sản phẩm
      for (const item of items) {
        const product = await prisma.product.findUnique({ where: { pid: item.pid } });
        await prisma.orderDetail.create({
          data: {
            oid: newOrder.oid,
            pid: item.pid,
            qty: item.qty,
            unit_price: product.price
          }
        });
      }

      // 4. Tạo thông tin Shipment tự động chuyển sang vận chuyển
      const newShipment = await prisma.shipment.create({
        data: {
          oid: newOrder.oid,
          status: 'Processing / Shipping'
        }
      });

      return { newOrder, newShipment };
    });

    return res.status(201).json({
      status: 'success',
      message: 'Order placed and shipment created successfully!',
      data: result
    });

  } catch (error) {
    console.error("Order error:", error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  createOrder
};