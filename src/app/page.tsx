'use client';


import ZodForm from "./Components/ZodForm";
import OrdersPage from "./orders/page";

export default function Home() {
  return (
    <main>
    <OrdersPage></OrdersPage>
    <ZodForm></ZodForm>
    </main>
  );
}
