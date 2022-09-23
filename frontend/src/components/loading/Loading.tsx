import React from "react";

import style from "./loading.module.css";

export const Loading = ({ children }: { children: React.ReactNode }) => (
  <div className={style.loading}>{children}</div>
);
