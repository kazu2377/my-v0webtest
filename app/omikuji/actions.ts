"use server";

export async function handleServerAction() {
  console.log("handleServerAction");
}

export async function handleGreeting(formData: FormData) {
  const name = formData.get("name") as string;
  // ここでデータベースへの保存や他の処理を行うことができます
  return `こんにちは、${name}さん！`;
}
