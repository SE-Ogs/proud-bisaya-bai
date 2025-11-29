export type AboutAward = {
  id: string;
  title: string;
  years: string;
};

export type AboutContent = {
  id: string;
  body: string;
  awards: AboutAward[];
};


