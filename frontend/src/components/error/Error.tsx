import React from "react";

import style from "./error.module.css";

export const Error = ({ children }: { children: React.ReactNode }) => (
  <div className={style.error}>{children}</div>
);
