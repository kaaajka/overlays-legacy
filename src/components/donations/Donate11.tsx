import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { DonateEventModel } from "../../models/DonateEvent";

const Donate11: React.FC<IDonate11Props> = ({ donate, images, withCommission }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ paused: true });

    tl.set(".sayLeft", { opacity: 0, x: -200 })
      .set(".sayRight", { opacity: 0, x: 200 })
      .set(".nickname", { scale: 0 })
      .set(".final", { opacity: 0, y: 100 })

      .to(".sayLeft", { opacity: 1, x: 0, duration: 0.5 }, 2.3)
      .to(".sayRight", { opacity: 1, x: 0, duration: 0.5 }, 4.6)
      .to(".nickname", { scale: 1, duration: 0.4, ease: "back.out(1.7)" }, 6.2)
      .to(".final", { opacity: 1, y: 0, duration: 0.6 }, 8.0);

    audioRef.current?.play();
    tl.play();
  }, []);

  return (
    <div className="donateHolder" ref={wrapperRef}>

      <div className="sayLeft">SAY MY NAME</div>
      <div className="sayRight">SAY MY NAME</div>
      <div className="nickname">{donate.nickname}</div>

      <div className="final">
        <img src="/explosion.gif" alt="explosion" className="gif" />
        <div className="amount">
          {new Intl.NumberFormat("pl-PL", {
            style: "currency",
            currency: "PLN",
          }).format(
            (withCommission ? donate.amount - donate.commission : donate.amount) / 100
          )}
        </div>
        <div className="message">{donate.message}</div>
      </div>
    </div>
  );
};

interface IDonate11Props {
  donate: DonateEventModel;
  images: string[];
  withCommission: boolean;
}

export default Donate11;
