Hierarchical Circular Layouts
=============
Hierarchical Circular Layouts (HCL) is a novel visualization technique for representing the structure and connectivity in deeply nested trees. HCL was inspired by our ongoing work in creating biological pathway visualizations that enable a range of different visual analytics tasks. Although biological pathways can be thought of as interconnected graph structures, domain experts tend to carve out particular subgraphs of pathways in order to limit their complexity and to focus on the components that are relevant to a particular research problem. For the most part, the representations of these pathways are hierarchical structures.

An important consideration in visualizing biological pathways is clearly showing how particular biological elements influence or are influenced by other elements. That is, it can be necessary to highlight relevant interconnected sub-trees with a particular directionality, while at the same time making sure not to obscure the hierarchical information in the tree. 

This technique supports a range of interactions on this representation, such as collapsing or expanding of node in the hierarchy to simplify or or to fully explore its structure, selecting a connection between two nodes, and highlighting relationships involving an selected item in the hierarchy.


![ScreenShot](http://www.cs.uic.edu/~tdang/HCL/TeaserHCL.png)

Hierarchical Circular Layouts is implemented in D3 (index.html in this folder) as well as in Processing available at: https://github.com/CreativeCodingLab/PathwayViewer.

This work was funded by the DARPA Big Mechanism Program under ARO contract WF911NF-14-1-0395.










