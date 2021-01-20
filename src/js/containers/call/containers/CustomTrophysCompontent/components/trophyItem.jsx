import styled, { css } from "styled-components";

const TrophyItem = styled.li.attrs({
    className: "customTrophysItem",
    title: ({ trophyname }) => trophyname
})`
    ${({ trophyIcon }) => trophyIcon ? "background: url(" + window.WBGlobal.nowUseDocAddress + trophyIcon + ") no-repeat center center;" : ""}
    background-size: 80% 80%;
`;

export default TrophyItem;