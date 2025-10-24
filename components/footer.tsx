import * as React from "react";

import discordIcon from "@/public/icons/discord-lg.svg";
import twitterIcon from "@/public/icons/x.svg";
import githubIcon from "@/public/icons/github-lg.svg";
import Image from "next/image";
import Link from "next/link";

const links = [
  {
    title: "Walrus Website",
    link: "https://walrus.xyz",
  },
  {
    title: "Whitepaper",
    link: "https://github.com/MystenLabs/walrus-docs/blob/main/docs/walrus.pdf",
  },
  {
    title: "Explorer",
    link: "https://walruscan.com/testnet/home",
  },
  {
    title: "Media Kit",
    link: "https://drive.google.com/drive/folders/1AoWZPWhrjSSNhpVLjVjuf7J3pA2imheq",
  },
  {
    title: "Terms and Conditions",
    link: "/airdrop/terms-and-conditions",
  },
  {
    title: "Privacy Policy",
    link: "/airdrop/privacy-policy",
  },
];

const socials = [
  {
    icon: twitterIcon,
    link: "https://x.com/WalrusProtocol",
  },
  {
    icon: discordIcon,
    link: "https://discord.gg/walrusprotocol",
  },
  {
    icon: githubIcon,
    link: "https://github.com/MystenLabs/walrus-docs",
  },
];

export const Footer = () => {
  return (
    <div className="flex flex-col xl:flex-row gap-4">
      {/* Links */}
      <div
        className={`bg-[#0C0F1D] xl:flex-1 rounded-2xl grid grid-cols-2 text-[##F7F7F7] font-montreal py-10 px-10 gap-10`}
      >
        {links.map((link, idx) => (
          <Link  key={idx} href={link.link} target="_blank" rel="noopener noreferrer">
            <span className={`text-lg text-center md:text-left font-montreal hover:underline hover:text-[#97F0E5] hover:cursor-pointer`}>
              {link.title}
            </span>
          </Link>
        ))}
      </div>

      {/* Socials */}
      <div className="xl:flex-1 grid grid-cols-3 border-2 border-[#0C0F1D] bg-[#0C0F1D] gap-[2px] rounded-3xl overflow-clip">
        {socials.map((social, idx) => (
          <Link key={idx} href={social.link} target="_blank" rel="noopener noreferrer" className="bg-white h-24 xl:h-full flex items-center justify-center rounded-none hover:cursor-pointer hover:bg-gray-200">
            <button
              
              className="h-24 xl:h-full w-full flex items-center justify-center rounded-none"
            >
              <Image alt="social" className="w-8 h-8 sm:w-12 sm:h-12" src={social.icon} />
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
};
