const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("CarbonCredits", function () {

  let carbon, owner, user1, amount;

  before(async () => {
    [owner,user1] = await ethers.getSigners();
    //const networkData = await ethers.provider.getNetwork();
    await hre.run('compile');
    amount = ethers.utils.parseEther('1');
    const carbonContract = await ethers.getContractFactory('CarbonCredits');
    carbon = await carbonContract.deploy();
  });

  describe("Unit Tests", function () {
    
    it("Should mint tokens", async function () {
      await carbon.mint({value:amount});
      const bal = await carbon.balanceOf(owner.address);
      expect(bal).to.equal(amount);
    });

    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.utils.parseEther('0.1');
      await carbon.transfer(user1.address, transferAmount);
      const user1Balance = await carbon.balanceOf(user1.address);
      expect(user1Balance).to.equal(transferAmount);
      const ownerBalance = await carbon.balanceOf(owner.address);
      expect(ownerBalance).to.lt(ethers.utils.parseEther('1'));
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      await expect(
        carbon.connect(user1).transfer(owner.address, ethers.utils.parseEther('20'))
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Should reduce balances over time", async function () {
      const initialOwnerBalance = await carbon.balanceOf(owner.address);
      const oneDayLater = (await time.latest()) + 86400;
      await time.increaseTo(oneDayLater);
      let ownerBalance = await carbon.balanceOf(owner.address);
      expect(ownerBalance).lt(initialOwnerBalance);
      const SixMonthLater = (await time.latest()) + 16000000;
      await time.increaseTo(SixMonthLater);
      ownerBalance = await carbon.balanceOf(owner.address);
      expect(ownerBalance).lt(initialOwnerBalance.div(2));
      expect(ownerBalance).gt(initialOwnerBalance.div(3));
      const MoreThanOneYearLater = (await time.latest()) + 32000000;
      await time.increaseTo(MoreThanOneYearLater);
      ownerBalance = await carbon.balanceOf(owner.address);
      expect(ownerBalance).eq(0);
    });
  });
});
