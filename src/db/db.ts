import { Database } from "sqlite3";
import { GrammarEntry } from "./db.interface";

const dbSelect = async (db: Database, stmt: string) => {
  return new Promise<any>((resolve, reject) => {
    db.all(stmt, [], (error, result) => {
      if (error) reject(error);
      resolve(result);
    });
  });
};

export const updateGrammarToSelected = (db: Database, id: number) => {
  const stmt = db.prepare("UPDATE grammar SET selected = 1 WHERE id = ?");
  stmt.run(id);
  stmt.finalize();
};

const grammarToString = (grammar: GrammarEntry): string => {
  // region 先組出文法簡介、再組例文
  return `
    [N${grammar.level}] ${grammar.title}

    ${grammar.content}

    ${grammar.example}
  `;
};

export const selectTopGrammar = async (
  db: Database
): Promise<string | null> => {
  const result: GrammarEntry[] = await dbSelect(
    db,
    "SELECT * FROM grammar WHERE selected = 0 limit 1"
  );

  if (result && result.length > 0) {
    const grammar = result[0];
    updateGrammarToSelected(db, grammar.id);
    return grammarToString(grammar);
  }
  return null;
};
