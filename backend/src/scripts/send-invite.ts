import dotenv from "dotenv";
import fs from "fs-extra";
import Handlebars from "handlebars";
import { sendNusisInvitation } from "../service/emailService";

dotenv.config();

type Args = {
  to?: string;
  school?: string;
  name?: string;
  role?: string;
  org?: string;
  dry?: boolean;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  const propMap: Record<string, keyof Args> = {
    to: "to",
    school: "school",
    name: "name",
    role: "role",
    org: "org",
  };

  const tokens = argv.slice(2);
  let pendingKey: keyof Args | null = null;

  for (const token of tokens) {
    if (pendingKey && !token.startsWith("--")) {
      (args as any)[pendingKey] = token;
      pendingKey = null;
      continue;
    }

    if (token === "-h" || token === "--help") {
      printHelp();
      process.exit(0);
    }

    if (!token.startsWith("--")) {
      continue;
    }

    const rx = /^--([^=]+)(?:=(.*))?$/;
    const m = rx.exec(token);
    if (!m) continue;
    const key = m[1];
    const val = m[2];

    if (key === "dry") {
      (args as any).dry = val ? val === "true" || val === "1" : true;
      continue;
    }

    const prop = propMap[key];
    if (!prop) continue;

    if (val !== undefined) {
      (args as any)[prop] = val;
    } else {
      pendingKey = prop;
    }
  }

  return args;
}

function printHelp() {
  console.log(`\nUsage: send-invite --to <email> --school <name> --name <signoff> --role <role> --org <org> [--dry]\n\nOptions:\n  --to       Recipient email address (required unless --dry)\n  --school   Recipient school name (required)\n  --name     Sign-off name (required)\n  --role     Sign-off role (required)\n  --org      Sign-off organisation (required)\n  --dry      Render template to stdout without sending\n`);
}

async function dryRunRender(school: string, name: string, role: string, org: string) {
  const templatePath = "src/email/templates/nusis-invitation-2025.html";
  const source = await fs.readFile(templatePath, "utf8");
  const compiled = Handlebars.compile(source);
  const html = compiled({
    recipientSchool: school,
    signoffName: name,
    signoffRole: role,
    signoffOrg: org,
  });
  console.log(html);
}

async function main() {
  const { to, school, name, role, org, dry } = parseArgs(process.argv);

  if (!school || !name || !role || !org) {
    console.error("Missing required fields.\n");
    printHelp();
    process.exit(1);
  }

  if (dry) {
    await dryRunRender(school, name, role, org);
    return;
  }

  if (!to) {
    console.error("--to is required when not using --dry\n");
    printHelp();
    process.exit(1);
  }

  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.error("GMAIL_USER and GMAIL_PASS must be set to send email.");
    process.exit(1);
  }

  try {
    const info = await sendNusisInvitation(to, {
      recipientSchool: school,
      signoffName: name,
      signoffRole: role,
      signoffOrg: org,
    });
    // Nodemailer info object fields vary by transport; log common ones safely
    console.log("Sent.");
    if ((info as any).messageId) console.log("messageId:", (info as any).messageId);
    if ((info as any).accepted) console.log("accepted:", (info as any).accepted);
    if ((info as any).response) console.log("response:", (info as any).response);
  } catch (err) {
    console.error("Failed to send:", err);
    process.exit(1);
  }
}

main();


// npm run invite:dry -- --school "Bukit Batok Secondary School" --name "Test (Mr.)" --role "Head of Test" --org "NUSIS 2025 Organising Committee"
// npm run invite:send -- --to jonykhozhixiong@gmail.com --school "Bukit Batok Secondary School" --name "Test (Mr.)" --role "Head of Test" --org "NUSIS 2025 Organising Committee"