import { Router } from "express";

const router = Router();

const products = [
  { id: "p1", name: "Node Notebook", price: 12000 },
  { id: "p2", name: "Express Mug", price: 8000 },
  { id: "p3", name: "Router Sticker", price: 3000 },
];

router.get("/", (req, res) => {
  res.json({
    router: "products",
    count: products.length,
    data: products,
  });
});

router.get("/:id", (req, res) => {
  const product = products.find((item) => item.id === req.params.id);

  if (!product) {
    res.status(404).json({
      message: `${req.params.id} 상품을 찾을 수 없습니다.`,
    });
    return;
  }

  res.json({
    router: "products",
    data: product,
  });
});

export default router;

