import React, { VFC } from "react";

type Token = {
  address: string;
  symbol: string;
  balance: string;
};

interface Props {
  tokens: Token[];
  // childrenを定義していない
}

export const TableRows: VFC<Props> = (props) => {
  const tokens = props.tokens;
  return (
    <>
      {tokens.map((token: Token) => {
        return (
          <tr key={token.address}>
            <td align="center">{token.symbol}</td>
            <td align="center">{token.balance}</td>
          </tr>
        );
      })}
    </>
  );
};
