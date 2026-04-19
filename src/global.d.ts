import ptBR from "./messages/pt-BR.json";

type Messages = typeof ptBR;

declare global {
  interface IntlMessages extends Messages {}
}
