'use client';

import Image from "next/image";
import styles from "./page.module.css";
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
